import type { Unit } from "./types";

export const UNIT_INFLATION_INVESTING: Unit = {
 id: "inflation-investing",
 title: "Inflation & Real Return Investing",
 description:
 "Master inflation mechanics, inflation-protected assets, real return analysis, and portfolio strategies to preserve purchasing power across economic cycles",
 icon: "",
 color: "#f97316",
 lessons: [
 // Lesson 1: Inflation Mechanics 
 {
 id: "inflation-investing-1",
 title: "Inflation Mechanics",
 description:
 "CPI vs PCE, core vs headline, inflation expectations (breakevens), and hyperinflation history",
 icon: "TrendingUp",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "CPI vs PCE: The Two Inflation Rulers",
 content:
 "**Inflation** is measured differently depending on the purpose — and the choice of measure affects every TIPS bond, Social Security payment, and Fed decision.\n\n**CPI — Consumer Price Index:**\nPublished monthly by the Bureau of Labor Statistics. Tracks the price of a *fixed basket* of goods: housing (~33%), transportation, food, medical care, apparel, and recreation.\n- **Headline CPI**: includes all items — energy and food included\n- **Core CPI**: strips out food and energy (more volatile) to reveal underlying inflation trend\n- Used for: TIPS principal adjustments, Social Security COLA, rent escalators\n\n**PCE — Personal Consumption Expenditures:**\nPublished by the BEA. The **Federal Reserve's preferred measure**.\n- Uses *chain-weighting*: if beef prices spike and consumers switch to chicken, PCE captures that substitution — CPI does not\n- Typically runs 0.3–0.5% lower than CPI\n- Fed's official 2% inflation target is measured against PCE\n\n**Why the gap matters for investors:**\nA TIPS bond is indexed to CPI, but Fed policy is calibrated to PCE. When the two diverge significantly, TIPS holders can earn a CPI-based adjustment that exceeds what the Fed is targeting — a subtle but real advantage.\n\n**Core vs Headline distinction:**\nCore is better for reading long-run inflation *trends*. Headline matters for *actual cost of living* — energy and food are 20–25% of spending for most households.",
 highlight: ["CPI", "PCE", "core", "headline", "COLA", "chain-weighting", "2% target"],
 },
 {
 type: "teach",
 title: "Inflation Expectations & Breakeven Rates",
 content:
 "**Inflation expectations** are what markets and consumers *believe* future inflation will be — and they are arguably more important than current inflation itself.\n\n**Why expectations drive outcomes:**\nIf businesses expect 5% inflation next year, they pre-emptively raise prices 5%. If workers expect 5%, they demand 5% wage increases. Expectations become self-fulfilling — this is why the Fed obsessively *manages* expectations.\n\n**Market-based measures of expectations:**\n\n**Breakeven Inflation Rate:**\nThe most precise market signal. Calculated as:\n> Breakeven = Nominal Treasury Yield TIPS Yield (same maturity)\n\nExample: 10-year Treasury yields 4.5%, 10-year TIPS yields 2.0% Breakeven = **2.5%**\nThis means the bond market prices in 2.5% average annual inflation over 10 years. If actual inflation exceeds 2.5%, TIPS outperforms the nominal Treasury; if below, the nominal Treasury wins.\n\n**Survey-based measures:**\n- **University of Michigan Consumer Sentiment Survey**: 1-year and 5–10 year inflation expectations\n- **Fed's Survey of Professional Forecasters**: consensus from economists\n- **TIPS market implied inflation**: real-time market consensus\n\n**Fed's response to unanchored expectations:**\nWhen 5-year breakeven inflation rises above 2.5–3%, the Fed becomes alarmed. Unanchored long-term expectations signal the market no longer trusts the Fed to hit its 2% target — at which point large rate hikes become almost certain.",
 highlight: ["inflation expectations", "breakeven rate", "TIPS yield", "nominal Treasury", "unanchored", "2.5%"],
 },
 {
 type: "teach",
 title: "Hyperinflation History: Weimar, Zimbabwe, Turkey",
 content:
 "**Hyperinflation** is formally defined as inflation exceeding **50% per month** — prices more than double every 51 days. It represents a complete breakdown of monetary credibility.\n\n**Weimar Germany (1921–1923):**\n- Root cause: Germany printed money to pay WWI reparations after the Treaty of Versailles\n- Peak rate: prices doubled every **3.7 days** (November 1923)\n- Famous images: workers paid twice daily, pushing wheelbarrows of banknotes to buy bread\n- Resolution: new currency (Rentenmark) backed by land mortgages replaced the Papiermark at 1 trillion to 1\n- Lesson: monetizing war debts without productive backing destroys currency\n\n**Zimbabwe (2007–2008):**\n- Root cause: land seizures collapsed agricultural output; government printed to fund spending\n- Peak: monthly inflation of **79.6 billion percent** (November 2008)\n- The government issued 100-trillion-dollar banknotes. A loaf of bread cost Z$10 billion\n- Resolution: dollarized the economy — abandoned the Zimbabwean dollar entirely\n- Lesson: when the government uses the printing press for fiscal policy, hyperinflation follows\n\n**Turkey (2021–2024):**\n- Not classic hyperinflation, but annual inflation exceeded **85% (2022)** and lingered above 60%\n- Unusual cause: President Erdogan's unorthodox belief that *high rates cause inflation* led to rate *cuts* while inflation surged\n- Turkish lira lost 80%+ of value vs USD between 2021 and 2023\n- Lesson: institutional credibility and central bank independence are inflation anchors\n\n**Investor takeaways from hyperinflation history:**\n- Hard assets (land, commodities, foreign currency) preserve value; local-currency cash and bonds are destroyed\n- Government bonds of hyperinflating nations become worthless — duration risk becomes existential risk\n- Diversification across currencies and geographies is the ultimate macro hedge",
 highlight: ["Weimar", "Zimbabwe", "Turkey", "hyperinflation", "monetizing", "dollarization", "central bank independence"],
 },
 {
 type: "quiz-mc",
 question:
 "What does the 10-year breakeven inflation rate represent in bond markets?",
 options: [
 "The market's implied average annual inflation expectation over the next 10 years",
 "The maximum inflation rate at which TIPS bonds stop paying interest",
 "The Fed's official 2% inflation target adjusted for the current yield curve",
 "The difference between corporate bond yields and government bond yields",
 ],
 correctIndex: 0,
 explanation:
 "The breakeven inflation rate = nominal Treasury yield minus TIPS yield of the same maturity. It represents the average annual inflation rate the bond market is pricing in over that period. If actual inflation comes in higher than the breakeven, TIPS outperforms the equivalent nominal Treasury; if lower, the nominal Treasury wins. It is a real-time, forward-looking inflation expectation signal.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Core CPI is a better measure of long-run inflation trends than headline CPI because it excludes volatile food and energy prices, which tend to revert over time.",
 correct: true,
 explanation:
 "True. Food and energy prices are highly volatile — oil prices can swing 30–50% in months due to OPEC decisions or geopolitical events, while food prices spike with weather events or supply disruptions. These swings are often temporary. Core CPI strips them out to reveal the underlying, persistent inflation trend in services, shelter, and durable goods — which is what the Fed primarily targets when calibrating interest rate policy.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A country's central bank has been cutting interest rates aggressively while the government runs large deficits financed by direct bond purchases by the central bank. Annual inflation has reached 40% and is accelerating. The currency has lost 60% of its value in one year. Businesses are pricing goods in foreign currencies.",
 question: "Based on historical hyperinflation examples, what is the most likely near-term outcome if policies remain unchanged?",
 options: [
 "Inflation accelerates further as currency credibility collapses and expectations become unanchored",
 "Inflation self-corrects as higher prices reduce consumer demand and restore equilibrium",
 "Foreign currency pricing is beneficial as it anchors inflation to a stable external benchmark",
 "Rate cuts will stimulate enough growth to increase tax revenues and reduce the deficit",
 ],
 correctIndex: 0,
 explanation:
 "When a central bank monetizes government deficits (printing money to fund spending), currency credibility collapses. Once businesses price in foreign currencies, local currency demand falls further — a vicious feedback loop. This mirrors Zimbabwe's trajectory. Without a credible policy reversal (sharp rate hikes, fiscal austerity, or dollarization), inflation typically accelerates until the currency is abandoned or fundamentally reformed.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: TIPS & I-Bonds 
 {
 id: "inflation-investing-2",
 title: "TIPS & I-Bonds",
 description:
 "TIPS inflation adjustment mechanics, real vs nominal yield, I-Bond limits and rates, TIPS laddering for income",
 icon: "Shield",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "How TIPS Actually Work",
 content:
 "**Treasury Inflation-Protected Securities (TIPS)** are US government bonds where the *principal* is adjusted for inflation — providing a guaranteed real return.\n\n**The mechanics step by step:**\n1. You buy a $1,000 TIPS bond with a 1.5% coupon\n2. CPI rises 5% over the first year\n3. Your principal is adjusted: $1,000 × 1.05 = **$1,050**\n4. Next coupon payment: 1.5% × $1,050 = **$15.75** (vs $15.00 on a nominal bond)\n5. If CPI continues rising, the principal grows further each period\n6. At maturity: you receive the **greater of** the inflation-adjusted principal or original $1,000 (deflation protection)\n\n**Real yield vs nominal yield:**\n- TIPS yield is a **real yield** — return above inflation\n- Nominal Treasury yield = Real yield + Expected inflation (Fisher equation)\n- If 10-year TIPS yields 2.0% and 10-year Treasury yields 4.5%:\n - Breakeven inflation = 4.5% 2.0% = 2.5%\n - If inflation averages above 2.5% TIPS wins\n - If inflation averages below 2.5% Nominal Treasury wins\n\n**Tax treatment — the phantom income trap:**\nEven though you don't receive the inflation adjustment as cash (it compounds in principal), the IRS taxes it as ordinary income each year. This makes TIPS most tax-efficient in tax-advantaged accounts (IRA, 401k).\n\n**TIPS ETFs** (like TIP, SCHP) pool many TIPS bonds but do NOT have a defined maturity — they continuously roll holdings, introducing interest rate sensitivity that individual TIPS held to maturity don't have.",
 highlight: ["TIPS", "real yield", "inflation adjustment", "principal", "breakeven", "phantom income", "Fisher equation"],
 },
 {
 type: "teach",
 title: "I-Bonds: The Retail Inflation Hedge",
 content:
 "**Series I Savings Bonds (I-Bonds)** are issued directly by the US Treasury and offer one of the most attractive inflation-protection mechanisms available to retail investors.\n\n**How I-Bond rates work:**\nThe composite rate has two components:\n- **Fixed rate**: set at purchase, never changes (0–1.3% historically)\n- **Inflation rate**: resets every 6 months based on CPI-U changes\n- **Composite rate** = Fixed rate + (2 × Inflation rate) + (Fixed rate × Inflation rate)\n\nExample: Fixed rate 0.9%, CPI-U 6-month change 3.24% Composite **7.38%** annualized\n\n**Why I-Bonds became popular in 2021–2022:**\nWith CPI surging to 8–9%, I-Bond rates reached 9.62% (May 2022 rate) — far exceeding any bank savings account or short-term bond. Millions of investors bought the $10,000 annual maximum.\n\n**Rules and constraints:**\n- **Purchase limit**: $10,000/year per person (+ $5,000 in paper bonds via tax refund)\n- **Minimum hold**: 12 months — cannot redeem early\n- **Early redemption penalty**: Redeem before 5 years forfeit last 3 months of interest\n- **After 5 years**: Redeem any time with no penalty\n- **Tax**: Federal income tax owed, but exempt from state/local tax; can defer until redemption\n\n**Strategic use:**\n- Emergency fund supplement (liquid after 12 months)\n- Education savings (interest tax-free if used for qualified education expenses)\n- Low-risk real return layer in a conservative portfolio",
 highlight: ["I-Bond", "composite rate", "fixed rate", "inflation rate", "$10,000 limit", "12-month lock", "9.62%"],
 },
 {
 type: "teach",
 title: "TIPS Laddering for Inflation-Protected Income",
 content:
 "**TIPS laddering** is a strategy that builds a portfolio of TIPS bonds maturing at regular intervals — providing reliable real income while managing interest rate risk.\n\n**Why laddering rather than a single TIPS bond or ETF:**\n- A single long-duration TIPS exposes you to market price swings before maturity\n- TIPS ETFs have no defined maturity — they fluctuate with real yield movements\n- A ladder provides a steady stream of maturing principals at known intervals — regardless of interest rates\n\n**How to build a 10-year TIPS ladder:**\n\n| Year | TIPS Maturity | Purpose |\n|------|--------------|----------|\n| 2025 | 1-year TIPS | Cash flow + inflation adjustment |\n| 2026 | 2-year TIPS | Cash flow + inflation adjustment |\n| ... | ... | ... |\n| 2034 | 10-year TIPS | Long-run inflation protection |\n\nEach year a TIPS matures, the inflation-adjusted principal is returned. You can reinvest at then-prevailing real yields or use the cash.\n\n**Real-world example:**\nA retiree builds a $500,000 TIPS ladder with $50,000 maturing each year for 10 years. If CPI averages 3% annually:\n- Year 1 maturity: $50,000 × 1.03^1 = $51,500\n- Year 5 maturity: $50,000 × 1.03^5 = $57,963\n- Year 10 maturity: $50,000 × 1.03^10 = $67,196\n\nThe retiree's income grows *with* inflation — preserving purchasing power throughout retirement.\n\n**Real yield environment matters:**\nLaddering is most attractive when real yields are positive (above 0%). In 2020–2021, TIPS real yields were deeply negative (1% to 2%), meaning investors paid a premium for inflation protection. In 2022–2024, real yields rose to 2%+, making TIPS ladders attractive again.",
 highlight: ["TIPS ladder", "real yield", "maturity", "interest rate risk", "inflation-adjusted principal", "purchasing power"],
 },
 {
 type: "quiz-mc",
 question:
 "You purchase a $10,000 TIPS bond with a 1% real coupon. In year one, CPI rises 6%. What is your coupon payment at the end of year one?",
 options: [
 "$106 (1% × $10,600 inflation-adjusted principal)",
 "$100 (1% × $10,000 original principal)",
 "$600 (6% inflation adjustment paid as coupon)",
 "$700 (1% coupon + 6% inflation adjustment combined)",
 ],
 correctIndex: 0,
 explanation:
 "With TIPS, the principal is first adjusted for inflation: $10,000 × 1.06 = $10,600. The coupon is then applied to the adjusted principal: 1% × $10,600 = $106. The extra $6 vs a nominal $100 coupon reflects inflation protection. The inflation-adjusted principal ($10,600) also grows your eventual maturity payment, providing cumulative protection against persistent inflation.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Series I Savings Bonds can be redeemed at any time after purchase without penalty, making them as liquid as a money market fund.",
 correct: false,
 explanation:
 "False. I-Bonds cannot be redeemed for the first 12 months after purchase — they are completely illiquid during that period. If redeemed between 12 months and 5 years, you forfeit the last 3 months of interest. Only after 5 years can you redeem without any penalty. While I-Bonds offer excellent inflation protection and tax benefits, their illiquidity rules out using them as a money market substitute.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An investor must choose between: (A) a 10-year nominal Treasury yielding 4.8%, and (B) a 10-year TIPS with a 2.3% real yield. The investor expects inflation to average 3% over the next 10 years based on current breakeven rates of 2.5%. The investor holds in a taxable account.",
 question: "Which investment is likely to produce the higher after-inflation return, and what is the key risk consideration?",
 options: [
 "TIPS at 2.3% real yield is better if inflation exceeds 2.5%; the phantom income tax reduces its net advantage in a taxable account",
 "The nominal Treasury always wins because 4.8% exceeds the 2.3% TIPS real yield",
 "TIPS is always better because inflation protection eliminates all investment risk",
 "Both are equivalent because the market has already priced in the inflation differential",
 ],
 correctIndex: 0,
 explanation:
 "The breakeven is 2.5% (4.8% 2.3%). If inflation averages 3% (above breakeven), TIPS produces 2.3% real vs the nominal Treasury's real return of 4.8% 3.0% = 1.8%. So TIPS wins by ~0.5% real. However, in a taxable account, the annual CPI principal adjustment is taxed as ordinary income even though it is not received as cash — this phantom income tax reduces TIPS' after-tax advantage. Holding TIPS in an IRA or 401k eliminates this drag.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Real Assets as Inflation Hedge 
 {
 id: "inflation-investing-3",
 title: "Real Assets as Inflation Hedge",
 description:
 "Commodities, real estate, infrastructure, timberland — inflation beta by asset class",
 icon: "Building",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "What Are Real Assets?",
 content:
 "**Real assets** are physical or tangible assets whose value is intrinsically linked to economic activity and often directly tied to the commodities, goods, or services that *cause* inflation.\n\n**Five major real asset categories:**\n\n**1. Commodities:**\nOil, natural gas, metals (copper, gold, silver), agricultural products (wheat, corn, soybeans). As inputs to production, commodity prices *are* inflation — a basket of commodities is the raw material from which the CPI is built.\n\n**2. Real Estate:**\nResidential, commercial, industrial, farmland. Rents typically escalate with inflation; property values are an inflation-sensitive real store of value.\n\n**3. Infrastructure:**\nToll roads, airports, pipelines, utilities, cell towers. Cash flows are often contractually linked to CPI — a toll road charges more when prices rise.\n\n**4. Timberland and Farmland:**\nUnique real assets that produce consumable output (timber, crops) while appreciating in land value. Timber actually grows in volume over time — a biological return on top of price appreciation.\n\n**5. Precious Metals:**\nGold and silver function more as a currency hedge and store of value than a pure inflation hedge — their relationship to CPI is inconsistent but they hedge monetary tail risk.\n\n**Why real assets hedge inflation:**\n- Their prices are denominated in the same units as the goods causing inflation\n- Cash flows (rents, royalties, commodity sales) can be contractually escalated\n- They represent *productive capacity* — not paper promises",
 highlight: ["real assets", "commodities", "real estate", "infrastructure", "timberland", "CPI linkage"],
 },
 {
 type: "teach",
 title: "Inflation Beta: Which Assets Hedge Best?",
 content:
 "**Inflation beta** measures how much an asset's real return moves for each 1% unexpected rise in inflation. A beta above 1 means the asset overcompensates; a beta below 0 means it is hurt by inflation.\n\n**Approximate inflation betas by asset class (academic research consensus):**\n\n| Asset Class | Inflation Beta | Notes |\n|-------------|---------------|-------|\n| Commodity futures | 5–8 | Direct input to CPI; strongest hedge |\n| Real estate (listed REITs) | 1–2 | Rents rise; but rate sensitivity can dampen returns |\n| Infrastructure (listed) | 1.5–3 | CPI-linked contracts; long-duration cash flows |\n| Timberland/Farmland | 2–4 | Crop/timber prices rise; land appreciates |\n| Gold | 0–1 | Inconsistent; better for currency collapse than CPI |\n| Equities (broad market) | 0.5 to 0.5 | Mixed; pricing power varies by sector |\n| Nominal bonds | 3 to 6 | Destroyed by surprise inflation; fixed payments worth less |\n| Cash (short-term T-bills) | 0.5–1 | Rates reset with inflation; modest protection |\n\n**Key insight for portfolio construction:**\nCommodity futures and infrastructure are the strongest pure inflation hedges. Real estate is strong but rate-sensitive. Equities and gold provide incomplete protection at best.\n\n**Caveat on listed vs unlisted:**\nPublicly traded REITs and infrastructure stocks trade in equity markets and can sell off when rates rise (the rate-hike channel), even though their underlying cash flows are inflation-protected. Unlisted (private) real assets avoid this equity market correlation — but are illiquid.",
 highlight: ["inflation beta", "commodity futures", "REITs", "infrastructure", "timberland", "nominal bonds", "listed vs unlisted"],
 },
 {
 type: "teach",
 title: "Commodities: The Direct Inflation Link",
 content:
 "**Commodities are unique** among inflation hedges because they are a *direct input* to the CPI basket — oil prices affect transportation, heating, plastics; wheat prices affect food; copper affects construction costs.\n\n**Energy sector breakdown:**\n- Crude oil and natural gas are the most impactful commodities — energy is ~7% of CPI directly, plus embedded in nearly every other category\n- When oil surges from $70 to $120/barrel, transportation costs rise, food grows more expensive to produce/ship, manufacturing input costs increase\n\n**Industrial metals:**\n- Copper is often called 'Dr. Copper' because its price predicts economic activity — demand from construction, EVs, and manufacturing drives prices\n- Aluminum, nickel, lithium are critical for energy transition — structural demand growth regardless of cycle\n\n**Agricultural commodities:**\n- Wheat, corn, soybeans are food price anchors — droughts, wars (Ukraine/Russia produce ~30% of global wheat), and fertilizer costs directly move food CPI\n\n**Investment vehicles for commodities:**\n- **Commodity futures**: most direct exposure; roll yield drag is a major cost (negative when futures curve is in contango)\n- **Commodity producers (equities)**: oil majors, miners — operating leverage amplifies commodity price moves\n- **Commodity ETFs**: PDBC, GSG, DJP — diversified baskets; contango drag varies by implementation\n- **Direct ownership**: physical gold/silver, farmland, timberland — highest inflation protection but illiquid\n\n**Roll yield — the hidden cost:**\nMost commodity ETFs hold *futures*, not physical commodities. When front-month futures expire and the ETF 'rolls' to the next month, it often buys at a higher price (contango) — a persistent drag of 5–15% annually in some markets.",
 highlight: ["commodities", "oil", "copper", "contango", "roll yield", "commodity futures", "Dr. Copper"],
 },
 {
 type: "quiz-mc",
 question:
 "Why do commodity futures have a higher inflation beta than listed REITs, even though both are considered inflation hedges?",
 options: [
 "Commodities are direct inputs to the CPI basket, while REITs trade in equity markets and are also sensitive to rising interest rates",
 "Commodity futures have no counterparty risk, making them safer than REIT equities during inflation",
 "REITs must pay out 90% of income as dividends, reducing their ability to benefit from price increases",
 "Commodity futures are backed by the US government, while REITs have no such guarantee",
 ],
 correctIndex: 0,
 explanation:
 "Commodity prices are literally what CPI is made of — oil, food, metals are inputs to the inflation index. A rise in energy prices directly causes CPI to rise, so commodity futures respond immediately and proportionally (or more). REITs own real assets with inflation-linked rents, but they trade on stock exchanges where rising interest rates — which accompany inflation — push up discount rates and depress REIT valuations. The equity market channel partially offsets their real asset inflation protection.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Timberland is a unique real asset because it generates a biological return — timber volume grows even if prices remain flat, providing a return component that is independent of market conditions.",
 correct: true,
 explanation:
 "True. Timberland has a biological growth return: trees grow in volume each year regardless of timber market prices. This means a timberland investment earns a return from physical volume increase (typically 3–5% annually) plus any timber price appreciation, plus land value appreciation. This multi-source return — biological growth, commodity price, and land value — makes timberland one of the most consistent inflation hedges over long periods.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An institutional endowment holds 60% equities and 40% nominal bonds. Inflation suddenly spikes to 7% for three consecutive years. The bond portfolio yields 3% (nominal), and equities return 5% (nominal) — below the inflation rate. The investment committee considers adding real assets.",
 question: "Which allocation change would most directly improve the portfolio's real return during this inflation episode?",
 options: [
 "Replace a portion of nominal bonds with commodity futures and infrastructure, which have positive inflation betas",
 "Shift from bonds to equities, since stocks always beat inflation over the long run",
 "Hold more cash, as short-term rates will eventually rise above inflation",
 "Add gold as the primary inflation hedge, given its historical track record in the 1970s",
 ],
 correctIndex: 0,
 explanation:
 "With 7% inflation, both bonds (real return: 3% 7% = 4%) and equities (real return: 5% 7% = 2%) are delivering negative real returns. Commodity futures and infrastructure have inflation betas of 5–8x and 1.5–3x respectively — meaning they tend to deliver positive real returns precisely during high-inflation periods. Replacing negative-real-yield bonds with these assets directly addresses the problem. Gold is less reliable for standard inflation episodes, and cash likely still yields below 7% inflation during the early part of a surge.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Equities & Inflation 
 {
 id: "inflation-investing-4",
 title: "Equities & Inflation",
 description:
 "Pricing power companies, commodity producers, REITs, stagflation equity performance, and sector rotation",
 icon: "BarChart2",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Pricing Power: The Key Equity Inflation Variable",
 content:
 "**The conventional wisdom** is that stocks hedge inflation because companies own real assets and can raise prices. **The nuance** is that only companies with genuine pricing power can actually do this.\n\n**Pricing power** is a company's ability to raise prices without losing significant unit volume — a function of brand strength, switching costs, inelastic demand, and competitive moat.\n\n**High pricing power — inflation winners:**\n- **Luxury goods** (LVMH, Hermes, Ferrari): premium customers accept price increases; brand scarcity commands premiums\n- **Energy producers** (ExxonMobil, Chevron): sell a commodity whose price *is* inflation; revenues rise automatically\n- **Consumer staples with strong brands** (Coca-Cola, Marlboro, Johnson & Johnson): habitual purchases resist substitution\n- **Healthcare/Pharma** (Johnson & Johnson, Eli Lilly): inelastic demand; pricing power on branded drugs\n- **Tech infrastructure** (Microsoft Azure, AWS, Google Cloud): switching costs are prohibitively high for enterprise customers\n\n**Low pricing power — inflation losers:**\n- **Commodity-user industries** (airlines, paper, chemicals): input costs surge; can't fully pass through\n- **Long-duration growth stocks** (early-stage tech, biotech): earnings are far in the future, harshly discounted when rates rise\n- **Fixed-price service businesses** (long-term contract SaaS, fixed-fee professional services)\n- **Utilities** (regulated): rates are set by regulators with lags; costs rise faster than revenues\n\n**The Buffett principle:**\nWarren Buffett has repeatedly stated that pricing power is the single most important business characteristic in an inflationary environment. He avoided airlines and embraced See's Candies, Coca-Cola, and Burlington Northern — all with strong pricing power.",
 highlight: ["pricing power", "luxury goods", "consumer staples", "inelastic demand", "moat", "switching costs", "long-duration"],
 },
 {
 type: "teach",
 title: "Stagflation Equity Performance & 1970s History",
 content:
 "**Stagflation is the worst environment for most equities** — high inflation compresses multiples while weak growth compresses earnings simultaneously.\n\n**The 1970s equity experience:**\n- **DJIA in nominal terms**: rose from ~800 (1970) to ~1,000 (1980) — just 25% over a decade\n- **In real (inflation-adjusted) terms**: a loss of approximately 40–50% of purchasing power\n- **P/E ratios** collapsed from 18× to 7× as rising rates raised the discount rate and weak earnings reduced the numerator\n- **'Nifty Fifty' growth stocks** (Xerox, Avon, Polaroid) fell 60–90% as their high P/Es were decimated by rising discount rates\n\n**1970s equity sector winners:**\n- **Energy/Oil**: ExxonMobil, Chevron — oil prices quadrupled with OPEC embargo\n- **Precious metals and miners**: Goldfields, Homestake Mining — gold surged from $35 to $850\n- **Commodity producers**: Fertilizer, potash, agricultural companies\n- **Real estate**: Hard assets; rents rose with inflation\n\n**2022 parallel:**\nIn 2022, a mini-stagflation episode played out:\n- Energy sector (XLE ETF): +65%\n- Consumer staples (XLP): nearly flat\n- Technology (QQQ): 33%\n- REITs: 27% (rate sensitive)\n\n**The lesson**: In stagflation or high-inflation environments, tilt toward commodity producers, energy, and pricing-power consumer staples. Reduce long-duration growth and interest-rate-sensitive sectors.",
 highlight: ["stagflation", "1970s", "P/E compression", "discount rate", "Nifty Fifty", "energy sector", "sector rotation"],
 },
 {
 type: "teach",
 title: "Sector Rotation Strategy in Inflationary Cycles",
 content:
 "**Sector rotation** is the strategic shift of portfolio allocation across economic sectors as the economic cycle evolves. Inflation is one of the clearest signals for sector rotation.\n\n**Inflation cycle sector playbook:**\n\n**Early inflation (rising but still modest, 2–4%):**\n- Economically cyclical sectors benefit from growth: Financials (banks earn more as rates rise), Industrials, Materials\n- Overweight: Energy, Financials, Industrials\n\n**Peak inflation (high and accelerating, 5%+):**\n- Commodity price surge directly benefits producers\n- Overweight: Energy, Materials, Consumer Staples\n- Underweight: Technology, Consumer Discretionary, Utilities, Real Estate\n\n**Disinflation (inflation falling from peak):**\n- Growth recovers; interest rate pressure eases\n- Overweight: Healthcare, Technology, Consumer Discretionary\n- Underweight: Energy, Materials\n\n**The rate hike effect on sectors:**\n| Sector | Response to Rate Hikes | Reason |\n|--------|----------------------|--------|\n| Technology | Very negative | Long-duration: high future earnings compressed |\n| Utilities | Negative | High debt, bond proxies compete with higher yields |\n| Financials | Positive | Higher net interest margin on loans |\n| Energy | Positive | Commodity prices independent of rates |\n| Consumer Staples | Neutral | Inelastic demand; dividend stocks compete with bonds |\n\n**Practical implementation:**\nSector ETFs allow precise rotation: XLE (energy), XLF (financials), XLP (consumer staples), XLK (technology), XLU (utilities). Rotation trades should be calibrated to inflation trajectory — not current level.",
 highlight: ["sector rotation", "early inflation", "peak inflation", "disinflation", "rate hike", "XLE", "XLF", "long-duration"],
 },
 {
 type: "quiz-mc",
 question:
 "Why did long-duration growth stocks fall so sharply in 2022 despite many companies still reporting positive earnings growth?",
 options: [
 "Rising interest rates increased the discount rate, compressing the present value of future earnings even if earnings grew",
 "Growth stocks are directly exposed to commodity prices, which surged in 2022",
 "Earnings growth is impossible during inflation because input costs always exceed revenue growth",
 "The Fed banned institutional investors from holding growth stocks during rate hike cycles",
 ],
 correctIndex: 0,
 explanation:
 "Stock valuation = present value of all future earnings. When discount rates (interest rates) rise, future earnings are worth less today — the denominator in the DCF increases. Long-duration growth stocks, whose earnings are heavily weighted toward the distant future, suffer the most. A company whose earnings are 70% expected after 2030 is extremely sensitive to a 1% rise in discount rates. In 2022, rates rose 4.25%, causing massive P/E multiple compression even with earnings growth.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An investor holds a 60/40 portfolio (60% broad equity index, 40% nominal 10-year bonds). CPI spikes to 8% and is expected to remain above 6% for 2 years. The Fed raises rates 4% over the next year. Oil prices surge 60%.",
 question: "Which sector tilt within the equity allocation would best improve real returns in this environment?",
 options: [
 "Tilt toward energy and consumer staples; reduce technology and utilities",
 "Tilt toward technology and consumer discretionary to benefit from consumer spending",
 "Increase allocation to utilities as they provide stable dividends during inflation",
 "Add long-duration bonds to the equity allocation for higher yield",
 ],
 correctIndex: 0,
 explanation:
 "In a high-inflation, rate-rising environment with surging oil: Energy directly benefits from $60% oil price gains (XLE was up 65% in 2022); Consumer Staples with pricing power preserve real revenues. Technology suffers from multiple compression (rates rising makes long-duration growth stocks less valuable). Utilities, while defensive, are bond proxies — they fall as rates rise because higher-yield bonds compete with their dividends, and their heavy debt loads become more expensive to service.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Fixed Income in Inflation 
 {
 id: "inflation-investing-5",
 title: "Fixed Income in Inflation",
 description:
 "Bond math when rates rise, floating rate bonds, TIPS vs nominal, duration management",
 icon: "FileText",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Bond Math: Why Prices Fall When Rates Rise",
 content:
 "**The fundamental inverse relationship** between bond prices and interest rates is critical to understanding fixed income in inflationary environments.\n\n**Why bond prices fall when rates rise:**\nA bond pays fixed cash flows (coupon + principal). When new bonds are issued at higher yields, the old fixed-rate bonds become less attractive by comparison — their price must fall until they offer the same yield as new issues.\n\n**Simple example:**\n- You hold a $1,000 bond with 3% coupon, paying $30/year\n- New bonds are issued at 5% coupon, paying $50/year\n- Your bond is worth less than $1,000 — buyers will discount it until its *yield* (coupon / price) equals 5%\n- $30 / 5% = **$600** — your $1,000 bond is now worth ~$600\n\n**Duration — sensitivity to rates:**\n**Duration** measures how much a bond's price changes for a 1% change in interest rates.\n- **Macaulay Duration**: weighted average time to receive cash flows (in years)\n- **Modified Duration**: approximate % price change per 1% rate move\n- Rule: a 10-year bond with 8-year modified duration falls ~8% if rates rise 1%\n\n**Duration by bond type:**\n| Bond Type | Approximate Duration | Rate Sensitivity |\n|-----------|---------------------|------------------|\n| 30-year Treasury | 18–20 years | Very high |\n| 10-year Treasury | 8–9 years | High |\n| 5-year Treasury | 4–5 years | Moderate |\n| 2-year Treasury | 1.9 years | Low |\n| Floating rate bond | Near 0 | Very low |\n\n**The 2022 bond crash:**\nLong-duration Treasuries fell 25–40% in 2022 as rates rose 4.25%. The iShares 20+ Year Treasury ETF (TLT) fell 33% — almost as much as the equity market.",
 highlight: ["bond price", "inverse relationship", "duration", "modified duration", "coupon", "yield", "TLT", "2022 bond crash"],
 },
 {
 type: "teach",
 title: "Floating Rate Bonds: Duration Zero",
 content:
 "**Floating rate bonds** (also called variable-rate or adjustable-rate bonds) have coupons that reset periodically based on a benchmark rate — protecting holders from rising rate environments.\n\n**How they work:**\nCoupon = Benchmark Rate + Fixed Spread\n- SOFR (Secured Overnight Financing Rate) is the primary benchmark since LIBOR was phased out in 2023\n- Example: SOFR + 150 bps. If SOFR is 4.5%, coupon = 6.0%. If SOFR rises to 5.5%, coupon automatically resets to 7.0%\n- Typical reset periods: 3 months, 6 months\n\n**Why floating rate bonds protect against inflation:**\n1. When inflation rises, the Fed raises rates\n2. Benchmark rates (SOFR, fed funds rate) rise\n3. Floating rate coupon resets higher automatically\n4. Bond price barely changes because the yield is always near market rates\n\n**Duration is near zero** — the price risk of a floating rate bond is minimal. The main risk is credit risk: if the issuer defaults, the floating rate doesn't save you.\n\n**Types of floating rate bonds:**\n- **Investment grade floaters**: corporate or government issuers, credit spreads 50–200 bps over SOFR\n- **Bank loans (leveraged loans)**: floating-rate debt from below-investment-grade companies; spreads 300–600 bps over SOFR. Held in CLOs and ETFs (BKLN)\n- **Treasury Floating Rate Notes (FRNs)**: floating-rate US government debt; ultra-low default risk\n- **Adjustable-rate mortgages (ARMs)**: floating rate for homeowners\n\n**Trade-off**: Floating rates protect from rising rates but provide no benefit if rates fall. They also tend to have lower starting yields than comparable fixed-rate bonds (compensation for the rate protection they provide).",
 highlight: ["floating rate", "SOFR", "reset", "duration zero", "leveraged loans", "CLO", "BKLN", "credit risk"],
 },
 {
 type: "teach",
 title: "Duration Management Strategy in Inflationary Periods",
 content:
 "**Active duration management** is the primary tool fixed-income investors use to navigate inflationary environments.\n\n**Core strategy: Shorten duration when inflation rises**\nAs inflation increases, rates tend to rise. Shorter-duration bonds:\n- Fall less in price when rates rise\n- Mature sooner — you can reinvest at higher yields quickly\n- Provide more liquidity for redeployment\n\n**The duration management toolkit:**\n\n**1. Barbell strategy:**\nConcentrate holdings at very short (1–2 year) and very long (20–30 year) maturities — avoid the intermediate. In rising rate environments, the short end provides stability and quick reinvestment; the long end can be gradually accumulated at peak rates for capital appreciation when rates eventually fall.\n\n**2. Bullet strategy:**\nConcentrate in a specific maturity band (e.g., 3–5 years). Predictable cash flows; moderate rate sensitivity. Suitable when inflation path is uncertain.\n\n**3. Ladder strategy:**\nEqual holdings across many maturities (1, 2, 3, 5, 7, 10 years). Provides automatic reinvestment at rolling market rates — naturally adapts to rising or falling rates without active management.\n\n**4. Treasury bill rolling:**\nDuring peak inflation/rate uncertainty, park funds in 3-month or 6-month T-bills. Rates reset to current market every quarter — near-zero duration, full government backing.\n\n**TIPS vs Nominal in duration context:**\nTIPS of the same maturity have lower duration than nominal Treasuries because their principal adjusts with inflation — reducing the present-value weight of fixed cash flows. A 10-year TIPS may have 7-year modified duration vs 8.5 for a comparable nominal Treasury.\n\n**2022 lesson in duration management:**\nInvestors who held long-duration nominal Treasuries (TLT, EDV) lost 33–40%. Investors who held T-bills or floating-rate notes lost near 0% — and earned rising income as rates reset higher every quarter.",
 highlight: ["duration management", "barbell", "bullet", "ladder", "T-bills", "shorten duration", "reinvestment", "TIPS duration"],
 },
 {
 type: "quiz-mc",
 question:
 "A bond has a modified duration of 9. If interest rates rise by 1.5%, approximately what happens to the bond's price?",
 options: [
 "Price falls approximately 13.5%",
 "Price rises approximately 9% because duration represents time to maturity",
 "Price falls exactly $9 per $100 of face value",
 "Price is unaffected because duration only measures yield sensitivity, not price sensitivity",
 ],
 correctIndex: 0,
 explanation:
 "Modified duration directly estimates the percentage price change for a 1% rate move. For a 1.5% rate increase with 9-year modified duration: price change Duration × Rate Change = 9 × 1.5% = 13.5%. A $100,000 bond would lose approximately $13,500 in market value. This is why long-duration bonds suffered severe losses in 2022 as rates rose 4.25% — bonds with 18-year duration lost 76% of their value.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Floating rate bonds are ideal fixed-income investments in all market environments because their adjustable coupons always keep pace with current interest rates.",
 correct: false,
 explanation:
 "False. Floating rate bonds excel in rising-rate (inflationary) environments, but they underperform in falling-rate environments. When rates drop, a fixed-rate bond's price rises — generating capital gains in addition to its coupon. Floating rate bonds miss this capital appreciation because their coupons adjust downward with falling rates. For falling-rate environments (recessions, disinflation), long-duration fixed-rate bonds outperform. Floaters are a tactical choice during inflation, not an all-weather strategy.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A fixed-income portfolio manager holds: 30% in 30-year Treasuries (duration 18), 40% in 10-year Treasuries (duration 8), 30% in 2-year Treasuries (duration 1.9). The Fed signals 3 more rate hikes totaling 0.75%. Inflation is at 5% and rising.",
 question: "What portfolio duration adjustment would best protect against further rate hikes, and what would be the approximately correct reallocation?",
 options: [
 "Reduce 30-year holdings, increase 2-year or T-bill allocation to lower overall portfolio duration",
 "Increase 30-year Treasury holdings to lock in higher yields before rates rise further",
 "Shift all holdings to 10-year TIPS to get inflation protection at moderate duration",
 "Add floating rate bonds to the existing portfolio while maintaining current duration",
 ],
 correctIndex: 0,
 explanation:
 "Current portfolio duration 0.30×18 + 0.40×8 + 0.30×1.9 = 5.4 + 3.2 + 0.57 = 9.17 years. With 3 more rate hikes of 0.75% total, price impact 9.17 × 0.75% = 6.9%. Reducing the 30-year allocation (duration 18 — highest sensitivity) and shifting to 2-year T-bills or floating rate notes dramatically lowers total portfolio duration and rate risk. Increasing 30-year holdings would amplify losses. The goal is to shorten duration ahead of known rate increases.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 6: Portfolio Inflation-Proofing 
 {
 id: "inflation-investing-6",
 title: "Portfolio Inflation-Proofing",
 description:
 "Golden butterfly, permanent portfolio, inflation-aware allocation, and real return targets",
 icon: "PieChart",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "The Permanent Portfolio: All-Weather Inflation Defense",
 content:
 "**The Permanent Portfolio** was developed by investment writer Harry Browne in the 1980s. It is designed to perform adequately across all four economic seasons — prosperity, inflation, deflation, and recession.\n\n**The four equal allocations:**\n| Allocation | Weight | Scenario it shines |\n|-----------|--------|-------------------|\n| Stocks (broad market) | 25% | Prosperity — growth and corporate profits |\n| Long-term Treasuries | 25% | Deflation — falling rates boost bond prices |\n| Gold | 25% | Inflation — currency debasement hedge |\n| Cash (T-bills) | 25% | Recession — safe haven, preserved liquidity |\n\n**How it handles inflation:**\n- Gold (25%) typically preserves value during currency debasement\n- Cash/T-bills (25%) reinvests at rising rates\n- Stocks (25%) with pricing power partially hedge\n- Long bonds (25%) hurt during inflation but provide convexity if deflation follows\n\n**Historical performance:**\n- Average annual return: ~5–6% nominal (1972–2023)\n- Worst single year: 4.2% (2022 — unusual because all four assets declined simultaneously)\n- Maximum drawdown: approximately 15% (vs 50%+ for 100% equities)\n- Significant underperformance vs pure equities during prolonged bull markets (2010–2021)\n\n**Trade-off:** The Permanent Portfolio sacrifices upside to minimize downside. It is a strategy for capital preservation across all environments, not wealth maximization.",
 highlight: ["Permanent Portfolio", "Harry Browne", "gold", "long-term Treasuries", "T-bills", "all-weather", "four seasons"],
 },
 {
 type: "teach",
 title: "The Golden Butterfly: Tilting for Better Real Returns",
 content:
 "**The Golden Butterfly Portfolio** is a modification of the Permanent Portfolio by Tyler Swickard (Portfolio Charts), designed to improve long-run returns while maintaining inflation resistance.\n\n**Allocations:**\n| Asset | Weight | Rationale |\n|-------|--------|----------|\n| US total stock market | 20% | Long-term growth engine |\n| US small-cap value | 20% | Value premium + inflation benefit |\n| Long-term Treasuries | 20% | Deflation hedge; 30-year bonds |\n| Short-term Treasuries | 20% | Liquidity; reinvests at rising rates |\n| Gold | 20% | Currency debasement, inflation tail |\n\n**Why small-cap value for inflation:**\nSmall-cap value companies (cheap, small businesses) tend to be more asset-heavy and less dependent on intangible future growth — less sensitive to discount rate compression. They also often have pricing power in local/niche markets.\n\n**Compared to Permanent Portfolio:**\n- Higher equity allocation (40% vs 25%) better long-run growth\n- Split between long and short Treasuries manages duration more carefully\n- Historically: slightly higher returns, similar drawdown protection\n\n**Real return targets for planning:**\nWhen setting investment goals, always use **real return targets** (above inflation):\n- Inflation (CPI): ~3% long-run target (Fed targets 2% PCE 2.5–3% CPI)\n- Conservative (bonds/cash heavy): real return 0.5–1.5%\n- Balanced (stocks/bonds): real return 3–5%\n- Aggressive growth (equity heavy): real return 5–7%\n\nA 7% nominal return in a 3% inflation world = 4% real. That 4% compounds into roughly 2× real wealth in 18 years (Rule of 72: 72/4 = 18 years to double).",
 highlight: ["Golden Butterfly", "small-cap value", "real return target", "Rule of 72", "balanced allocation", "deflation hedge"],
 },
 {
 type: "teach",
 title: "Building an Inflation-Aware Portfolio",
 content:
 "**Inflation-aware portfolio construction** goes beyond holding inflation hedges as a separate bucket — it integrates real return thinking throughout every allocation decision.\n\n**Key principles:**\n\n**1. Think in real returns, always:**\nBefore allocating, ask: 'What is this asset's expected real return given the inflation environment?' A 6% nominal bond is great in 2% inflation but terrible in 7% inflation.\n\n**2. Inflation-sensitive allocation grid:**\n\n| Environment | Overweight | Underweight |\n|-------------|-----------|-------------|\n| Low inflation (1–3%) | Growth stocks, long bonds | Commodities, gold |\n| Moderate inflation (3–5%) | TIPS, floating rate, staples | Long nominal bonds |\n| High inflation (5%+) | Energy, commodities, TIPS | Long bonds, growth tech |\n| Stagflation | Commodities, T-bills, gold | Equities broadly, bonds |\n\n**3. Inflation beta budget:**\nConstruct a portfolio with a *target inflation beta* of 0.5–1.5 — meaning it roughly keeps pace with inflation even in surprise scenarios. Calculate by weighting individual asset inflation betas.\n\n**4. Real asset sleeve (10–20% of portfolio):**\nDedicate a real asset sleeve: mix of TIPS (direct), commodity ETFs (PDBC), REITs (VNQ), and infrastructure (IFRA). This sleeve's explicit job is to hedge unexpected inflation.\n\n**5. Duration management:**\nKeep weighted average portfolio duration below 5 years unless you have a deflation thesis. Inflation destroys long-duration bond portfolios.\n\n**A practical all-inflation-environment portfolio:**\n| Asset | Weight | Inflation role |\n|-------|--------|---------------|\n| Global equities (value tilt) | 35% | Real growth, pricing power |\n| Short-term TIPS (0–5 year) | 15% | Direct CPI hedge |\n| Commodity ETF (PDBC) | 10% | Direct CPI input exposure |\n| Floating rate/T-bills | 15% | Rate protection, liquidity |\n| REITs (VNQ) | 10% | Real estate rents |\n| Long-term Treasuries | 10% | Deflation hedge |\n| Gold (GLD) | 5% | Currency tail risk |\n\n**Total expected inflation beta**: approximately 1.0–1.5 across most inflationary scenarios.",
 highlight: ["real return", "inflation beta", "real asset sleeve", "duration management", "PDBC", "VNQ", "inflation-aware"],
 },
 {
 type: "quiz-mc",
 question:
 "Why does the Permanent Portfolio include both long-term Treasuries and gold, given that gold is considered an inflation hedge while long bonds are hurt by inflation?",
 options: [
 "They hedge opposite scenarios: gold protects against inflation, long bonds protect against deflation — together they cover all economic seasons",
 "Long bonds and gold move together in all environments, providing consistent performance",
 "Gold's returns are derived from bond yields, making them complementary rather than opposing assets",
 "Long bonds protect against stock market crashes while gold protects against currency crises — both independent of inflation",
 ],
 correctIndex: 0,
 explanation:
 "Harry Browne designed the Permanent Portfolio around four distinct economic environments: prosperity (stocks excel), inflation (gold excels), deflation (long bonds excel — as rates fall, prices surge), and recession (cash preserves). Gold and long bonds are not chosen together because they correlate positively — they are chosen because they hedge *opposite* scenarios. Inflation destroys long bonds but benefits gold. Deflation benefits long bonds but weighs on gold. Together they ensure no scenario is completely unhedged.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A portfolio's 'real return target' should be calculated as the expected nominal return minus the current inflation rate — so a 7% expected return and 4% current inflation gives a 3% real return target.",
 correct: true,
 explanation:
 "True. The real return = nominal return minus inflation rate (Fisher equation). If a portfolio expects 7% nominal and inflation is running at 4%, the real return is approximately 3%. This is why investment planning should always express goals in real terms: a nominal 7% return sounds great but delivers very different outcomes if inflation is 2% (5% real) versus 6% (1% real). Long-term planning using nominal returns and ignoring inflation is one of the most common investment planning errors.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A 45-year-old investor holds: 70% equities (mostly US growth tech), 25% nominal 10-year bonds, 5% cash. CPI has been 5% for 2 years. Their financial goal is to retire in 20 years with real purchasing power preserved. The current portfolio duration is approximately 7 years. They have a 20-year time horizon.",
 question: "What is the most critical inflation-related vulnerability in their portfolio, and what adjustment would most improve inflation resilience?",
 options: [
 "Heavy growth tech exposure will suffer multiple compression in sustained high inflation; add TIPS, commodities, and value/energy equities as a real asset sleeve",
 "The 5% cash allocation is dangerously low — increase cash to 40% to hedge against inflation's erosion",
 "Nominal bonds should be doubled to 50% to lock in current yields before inflation rises further",
 "The portfolio is appropriately positioned as growth equities have always beaten inflation over 20-year periods",
 ],
 correctIndex: 0,
 explanation:
 "The portfolio has two major inflation vulnerabilities: (1) 70% in growth tech — the sector most sensitive to multiple compression when rates rise due to high discount rate sensitivity of long-duration earnings; (2) 25% in nominal bonds — real return of 10-year bonds is negative when CPI exceeds their yield. The right adjustment: reduce long-duration growth tech, add a real asset sleeve (10–15% in TIPS, commodities, and energy/value equities), and consider shortening bond duration or switching some nominal bonds to TIPS. Increasing cash to 40% would significantly drag long-term real returns.",
 difficulty: 3,
 },
 ],
 },
 ],
};
